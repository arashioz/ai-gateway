import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class LoginDTO {
    @ApiProperty()
    @IsEmail()
    username: string

    @ApiProperty()
    // @IsStrongPassword()
    password: string
}