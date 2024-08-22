import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetail } from 'src/entities/orderdetail.entity';
import { DataSource, Repository } from 'typeorm';
import { FinalOrderDto, ProductInfo } from './order.dto';
import { User } from 'src/entities/user.entity';
import { Product } from 'src/entities/products/product.entity';
import { ProductsOrder } from 'src/entities/product-order.entity';
import { OrderQuery } from './orders.query';
import { Transaccion } from 'src/entities/transaction.entity';
import { OrderStatus } from 'src/enum/orderStatus.enum';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(OrderDetail) private orderDetailRepository: Repository<OrderDetail>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(Transaccion) private transactionRepository: Repository<Transaccion>,
        @InjectRepository(ProductsOrder) private productsOrderRepository: Repository<ProductsOrder>,

        private readonly orderQuery: OrderQuery,
        private readonly dataSource: DataSource
    ){}

    async getOrders() {
        const orders = await this.orderQuery.getOrders()
        return orders
    }

    async getOrderById(id: string) {
        let finalOrder = new FinalOrderDto()
        const foundOrder = await this.orderQuery.getOrderById(id);
        if(!foundOrder) throw new NotFoundException(`Orden no encontrada. ID: ${id}`);
        const prices =  foundOrder.productsOrder.map(product => product.product.price)
        const quantity =  foundOrder.productsOrder.map(quantity => quantity.quantity)

        let finalPrice:number = 0
        let partialPrice:number = 0
        for (let i = 0; i < prices.length; i++) {
            partialPrice= prices[i]*quantity[i]
            finalPrice = finalPrice + partialPrice;
        }
        finalOrder = { 
            ...foundOrder, 
            finalPrice 
          };
        return finalOrder;
    }

    async getOrdersByUserId(id: string) {
        return await this.orderQuery.getOrdersByUserId(id)
    }

    async createOrder(
      userId: string, 
      productsInfo: ProductInfo[], 
      address: string | undefined, 
      discount: number | undefined, 
      deliveryDate: Date | undefined
    ) {
        let total = 0; 
        let createdOrder;
  
        const user = await this.userRepository.findOneBy({ id: userId, isDeleted: false });   
        if (!user) throw new BadRequestException(`User not found. ID: ${userId}`);
    
        await Promise.all(productsInfo.map(async (product)=> {
            const foundProduct = await this.productRepository.findOneBy({ id: product.id });
            if (!foundProduct) throw new BadRequestException(`Product not found. ID: ${product.id}`);
            if (foundProduct.stock <= 0) throw new BadRequestException(`Producto sin stock. ID: ${foundProduct.id}`);
        }));
  
        await this.dataSource.transaction(async (transactionalEntityManager) => {
            const order = transactionalEntityManager.create(Order, { user, date: new Date() });
            const newOrder = await transactionalEntityManager.save(order);
            createdOrder = newOrder;
    
            await Promise.all(productsInfo.map(async (product) => {
                await this.updateStock(product.id);
    
                const foundProduct = await transactionalEntityManager.findOneBy(Product, { id: product.id });
                if (!foundProduct) throw new BadRequestException(`Product not found. ID: ${product.id}`);
                
                total += ((foundProduct.price * product.quantity) * (1 - foundProduct.discount));
                
                const productsOrder = transactionalEntityManager.create(ProductsOrder, {
                    product: foundProduct, 
                    order: newOrder,
                    quantity: product.quantity
                });
    
                await transactionalEntityManager.save(ProductsOrder, productsOrder);
            }));
  
            if (discount) total *= (1 - discount);
  
            const orderDetail = transactionalEntityManager.create(OrderDetail, {
                totalPrice: Number(total.toFixed(2)),
                order: newOrder,
                discount: discount || 0,
                addressDelivery: address || 'Tienda',
                deliveryDate
            });
  
            await transactionalEntityManager.save(OrderDetail, orderDetail);
  
            await transactionalEntityManager.save(Transaccion, {
                status: OrderStatus.SOLICITADO,
                timestamp: new Date(),
                orderdetail: orderDetail
            });
        });
  
        return createdOrder;
    }

    // MODIFICAR DTO
    async updateOrder(orderId: string, productsInfo: ProductInfo[], address: string, discount: number, deliveryDate: Date) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['productsOrder', 'productsOrder.product', 'orderDetail']
        });
    
        if (!order) throw new NotFoundException('Orden no encontrada');
        
        // SOLICITAMOS DELIVERYDATE EN EL DTO
        order.orderDetail.deliveryDate = deliveryDate || order.orderDetail.deliveryDate;

        // ACÁ VA UPDATE DE ORDER Y ORDERDETAIL ANTES DEL SAVE (se hace con el id)
        await this.orderDetailRepository.save(order.orderDetail);
        await this.orderRepository.save(order);
        
        // ACÁ VA UPDATE DE STATUS DE TRANSACTION (se hace con el id así que hay que buscarlo en el repository)
        const transaction = this.transactionRepository.create({ status: OrderStatus.SOLICITADO });
        await this.transactionRepository.save(transaction);
    
        return order;
    }
  
    async deleteOrder(id: string) {
      return await this.orderQuery.deleteOrder(id);
    }
    
    async updateStock(id: string) {
        const product = await this.productRepository.findOne({ where: { id } });
        await this.productRepository.update({ id },{ stock: product.stock - 1 });
    }
}
