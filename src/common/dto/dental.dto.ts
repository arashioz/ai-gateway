import { ApiProperty } from "@nestjs/swagger";

export class DentalDto {
    @ApiProperty()
    apiKey: string

    @ApiProperty()
    file: string
    
    @ApiProperty()
    query: Object

}