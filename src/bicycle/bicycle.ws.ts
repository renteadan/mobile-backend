import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
	transports: ['websocket'],
})
export class WsService {

  @SubscribeMessage('getBikes')
  // @UseGuards(JwtAuthGuard)
	handleEvent(@MessageBody() data: string): string {
		console.log(data);
		return data;
	}
}