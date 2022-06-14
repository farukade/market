import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as Jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) { }

  async signUp(data: CreateUserDto) {
    try {
      if (!data.password && data.username!) return { success: false, message: "please enter username or password" };

      data.password = bcrypt.hashSync(data.password, 10);
      data.username = data.username.toLowerCase();

      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([data])
        .execute();

      return { success: true, message: "creation successfull" };

    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async signIn(data: CreateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { username: data.username.toLowerCase() }});
      if (!user) return { success: false, message: "user not found" };
      if (!await bcrypt.compare(data.password, user.password)) 
      return { success: false, message: "invalid credentials" };

      const payload = {
        id: user.id,
        username: user.username
      };
      const token = Jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 300000});
      return { success: true, payload, token };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    };
  }

  async findAll() {
    try {
      let rs = [];
      const users = await this.userRepository.find();
      if (users.length) {
        for (const user of users) {
          rs = [{ 
            id: user.id, 
            username: user.username,
            created_at: user.created_at,
            updated_at: user.updated_at
          }, ...rs]
        };
        return { success: true, users: rs };
      };
      return { success: false, message: "no user on database" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    };
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) return { success: false, message: "user not found" };
      const { password, ...restUser } = user;
      return { success: true, user: restUser };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    };
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      if (data.password) {
        const user = await this.userRepository.findOne({ where: { id }});
        if (!user) return { success: false, message: "user not found" };
        if (!await bcrypt.compare(data.password, user.password)) 
        return { success: false, message: "invalid credentials" };
      }
      const response = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(data)
        .where("id = :id", { id })
        .execute();

      if (response.affected) return { status: "success", message: "update success" };
      return { status: "false", message: "update failed" };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  }

  async remove(id: number) {
    try {
      const res = await this.userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
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
