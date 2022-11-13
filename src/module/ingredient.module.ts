import { IngredientController } from "@/controller/ingredient.controller";
import { Ingredient, IngredientCategory } from "@/model/entity";
import { IngredientService } from "@/service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ingredient, IngredientCategory]),
    ],
    exports: [TypeOrmModule, IngredientService],
    controllers: [IngredientController],
    providers: [IngredientService],
})
export class IngredientModule {}