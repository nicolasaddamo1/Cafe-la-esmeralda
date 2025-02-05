import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { PreloadService } from './preload/preload.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/products/product.entity';
import { Subproduct } from './entities/products/subprodcut.entity';
import { User } from 'src/entities/user.entity';
import { UsersModule } from './modules/users/users.module';
import { Coffee } from './entities/products/product-coffee.entity';
import { Mate } from './entities/products/product-mate.entity';
import { Endulzante } from './entities/products/product-endulzante.entity';
import {Te} from './entities/products/product-te.entity'
import { Chocolate } from './entities/products/product-chocolate.entity';
import { Accesorio } from './entities/products/product-accesorio.entity';
import { OrderModule } from './modules/order/order.module';
import { MercadoPagoModule } from './modules/mercadopago/mercado-pago.module';
import { JwtModule } from '@nestjs/jwt';
import { TestimonyModule } from './modules/testimony/testimony.module';
import { Testimony } from './entities/testimony.entity';
import { CategoryModule } from './modules/categories/category.module';
import { ImageModule } from './modules/images/image.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) =>
        ConfigService.get('typeorm'),
    }),
    TypeOrmModule.forFeature([Testimony,Product,Subproduct,Category,User,Coffee,Mate,Endulzante,Chocolate,Te,Accesorio]),
    AuthModule,
    ImageModule,
    UsersModule,
    ProductsModule,
    OrderModule,
    MercadoPagoModule,
    TestimonyModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1h' },
      secret: process.env.JWT_SECRET,
    }),
    CategoryModule,
    MailerModule
  ],
  controllers: [AppController],
  providers: [AppService, PreloadService],
})
export class AppModule {}
