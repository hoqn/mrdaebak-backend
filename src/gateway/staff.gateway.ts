import { CONFIG } from "@/config";
import { Order } from "@/model/entity";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

enum StaffEvents {
    NEW_ORDER = 'NEW_ORDER',
}

@WebSocketGateway(CONFIG.socketPort, { transports: ['websocket'], namespace: 'staff' })
export class StaffAlarmEventGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    private clients: Socket[] = [];

    public async notifyNewOrder(order: Order) {
        this.server.emit(StaffEvents.NEW_ORDER, order);
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        if(process.env.NODE_ENV === 'development')
            console.log(`${client.id} has connected.`);
        this.clients.push(client);
    }
    
    handleDisconnect(client: Socket) {
        if(process.env.NODE_ENV === 'development')
            console.log(`${client.id} has disconnected.`);
        this.clients.splice(this.clients.findIndex(c => c.id === client.id), 1);
    }
}