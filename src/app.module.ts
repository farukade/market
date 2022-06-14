import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/entities/cart.entity';
import { config } from 'dotenv';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
config();

@Module({
  imports: [ TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.PG_HOST,
    port: parseInt(<string>process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    entities: [
      Cart
    ],
    autoLoadEntities: true,
    synchronize: true, 
    ssl: {      /* <----- Add SSL option */
        require: true,
        rejectUnauthorized: false 
      }
    // logging: true,
  }), CartModule, ProductModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
