import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class OrderQuery {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
    ) {}

    async getOrderById(id: string) {
        const order = await this.orderRepository
            .createQueryBuilder('orders')
            .leftJoinAndSelect('orders.user', 'user')
            .leftJoinAndSelect('orders.productOrder', 'productOrder') 
            .leftJoinAndSelect('productOrder.product', 'products')
            .leftJoinAndSelect('orders.orderDetail', 'orderDetails')
            .leftJoinAndSelect('orderDetails.transactions', 'transaction')
            .where('orders.id = :orID', { orID: id })
            .andWhere('orders.isDeleted = :isDeleted', { isDeleted: false })
            .select([
                'user.id',
                'orders.id',
                'orders.date',
                'orderDetails.totalPrice',
                'orderDetails.deliveryDate',
                'transaction.status',
                'transaction.timestamp',
                'productOrder.quantity',  
                'products.id',
                'products.description',
                'products.price',
                'products.discount',
                'products.imgUrl',
            ])
            .getOne();

        return order;
    }

    async getOrdersByUserId(id: string) {
        const orders = await this.orderRepository
            .createQueryBuilder('orders')
            .leftJoinAndSelect('orders.user', 'user')
            .leftJoinAndSelect('orders.productOrder', 'productOrder')  
            .leftJoinAndSelect('productOrder.product', 'products')
            .leftJoinAndSelect('orders.orderDetail', 'orderDetails')
            .leftJoinAndSelect('orderDetails.transactions', 'transaction')
            .where('user.id = :orID', { orID: id })
            .andWhere('orders.isDeleted = :isDeleted', { isDeleted: false })
            .select([
                'user.id',
                'orders.id',
                'orders.date',
                'orderDetails.totalPrice',
                'orderDetails.deliveryDate',
                'transaction.status',
                'transaction.timestamp',
                'productOrder.quantity',  
                'products.id',
                'products.description',
                'products.price',
                'products.discount',
                'products.imgUrl',
            ])
            .getMany();

        return orders;
    }

    async getOrders() {
        const orders = await this.orderRepository
            .createQueryBuilder('orders')
            .leftJoinAndSelect('orders.user', 'user')
            .leftJoinAndSelect('orders.productsOrder', 'productsOrder')  
            .leftJoinAndSelect('productsOrder.product', 'products')
            .leftJoinAndSelect('orders.orderDetail', 'orderDetails')
            .leftJoinAndSelect('orderDetails.transactions', 'transaction')
            .where('orders.isDeleted = :isDeleted', { isDeleted: false })
            .select([
                'user.id',
                'orders.id',
                'orders.date',
                'orderDetails.totalPrice',
                'orderDetails.deliveryDate',
                'transaction.status',
                'transaction.timestamp',
                'productsOrder.quantity',  
                'products.id',
                'products.description',
                'products.price',
                'products.discount',
                'products.imgUrl',
            ])
            .getMany();

        return orders;
    }
}
