import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CreateCartDto) {
    @ApiProperty()
    id?: number;

    @ApiProperty()
    name?: string;

    @ApiProperty()
    quantity?: number;

    @ApiProperty()
    price?: number;

    @ApiProperty()
    orderNumber?: number;
}
