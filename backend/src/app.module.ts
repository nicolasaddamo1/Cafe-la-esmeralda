import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { PreloadService } from './preload/preload.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/products/product.entity';


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
    TypeOrmModule.forFeature([Category,Product]),
    ProductsModule
  ],
  controllers: [AppController],
  providers: [AppService, PreloadService],
})
export class AppModule {}
