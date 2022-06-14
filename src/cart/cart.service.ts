import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import * as crypto from 'crypto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>
  ) { }

  async makeOrder(data: CreateCartDto[]) {
    try {
      if (!data.length) {
        return { success: false, message: "no data" }
      };
      const orderCode: string = `${ Date.now() }${ crypto.randomBytes(5).toString("hex") }`;
      for (const item of data) {
        item.orderCode = orderCode;

      };
      const res = await this.cartRepository
        .createQueryBuilder()
        .insert()
        .into(Cart)
        .values(data)
        .execute();

      const newOrder = await this.cartRepository.find({ where: { orderCode }});
      // const total = 

      return { success: true, message: "order placed successfully", items: newOrder };

    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    };
  }

  async findAll(params) {
    try {
      const { page, limit } = params;
      if (!page || !limit) {
        return { success: false, message: "no page and/or limit in url params" };
      };
      const rs = await this.cartRepository.findAndCount({
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        order: {
          created_at: 'DESC'
        }
      });

      const carts = rs[0];
      const total = rs[1];
      if (!carts) {
        return { success: false, message: "item(s) not found" };
      }
      return { 
        success: true, 
        carts, 
        page: parseInt(page),
        limit: parseInt(limit),
        total
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async findOne(id: number) {
    try {
      const cart = await this.cartRepository.findOne({ where: { id } });
      if (!cart) {
        return { success: false, message: "item not found" };
      };
      return { success: true, cart };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async update(id: number, data: UpdateCartDto) {
    try {
      const response = await this.cartRepository
        .createQueryBuilder()
        .update(Cart)
        .set(data)
        .where("id = :id", { id })
        .execute();

      if (response.affected) {
        return { status: "success", message: "update success" };
      };
      return { status: "false", message: "update failed" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async remove(id: number) {
    try {
      const res = await this.cartRepository
        .createQueryBuilder()
        .delete()
        .from(Cart)
        .where('id = :id', { id })
        .execute();
  
      if (res.affected) {
        return { status: "success", message: "delete success" };
      };
      return { status: "success", message: "delete success" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }
}
