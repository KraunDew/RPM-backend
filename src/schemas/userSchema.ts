import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  firstName!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
