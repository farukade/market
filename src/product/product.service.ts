import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import * as crypto from 'crypto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) { }

  async createProducts(data: CreateProductDto[]) {
    try {
      const creationCode: string = `${Date.now()}${crypto.randomBytes(5).toString("hex")}`;
      for (const item of data) {
        item.creationCode = creationCode;
      };
      await this.productRepository
        .createQueryBuilder()
        .insert()
        .into(Product)
        .values(data)
        .execute();

      const res = await this.productRepository.find({ where: { creationCode } });

      return { success: true, message: "creation successfull", items: res };

    } catch (error) {
      return { success: false, message: error.message || "an error occured" }
    }
  }

  async createProduct(data: CreateProductDto) {
    try {
      const creationCode: string = `${Date.now()}${crypto.randomBytes(5).toString("hex")}`;
      data.creationCode = creationCode;

      await this.productRepository
        .createQueryBuilder()
        .insert()
        .into(Product)
        .values([data])
        .execute();

      const res = await this.productRepository.findOne({ where: { creationCode } });

      return { success: true, message: "creation successfull", items: res };

    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async findAll(params) {
    try {
      const { page, limit } = params;
      if (!page || !limit) {
        return { success: false, message: "no page and/or limit in url params" };
      };
      const rs = await this.productRepository.findAndCount({
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        order: {
          created_at: 'DESC'
        }
      });

      const products = rs[0];
      const total = rs[1];
      if (!products) {
        return { success: false, message: "item(s) not found" };
      }
      return { 
        success: true, 
        products, 
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
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        return { success: false, message: "item not found" };
      };
      return { success: true, product };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    };
  }

  async update(id: number, data: UpdateProductDto) {
    try {
      const response = await this.productRepository
        .createQueryBuilder()
        .update(Product)
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
      const res = await this.productRepository
        .createQueryBuilder()
        .delete()
        .from(Product)
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
