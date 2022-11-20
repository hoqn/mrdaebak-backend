/**
 * @type {import('@/config').Config}
 */

export default {
    serverPort: 8080,
    socketPort: 1111,
    db: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'mrdaebak_schedules',
        logging: true,
    },
    staff: {
        alarm: {
            newOrder: true, // 새로운 주문에 대한 알림을 받을지
            underIngredientStock: {
                currentStock: 15, // 현재 재고가 특정 수 이하로 내려갈 때 알림을 받을지. 필요 없을 시 undefined
            }
        }
    },
    user: {
        discountForVip: 10000, // 단골 할인 금액
        orderCountForVip: 5, // 단골로 승급하기 위한 주문 수
        alarm: {
            changeOrderState: true, // 자신의 주문 상태가 변할 시 알림을 받을지
        }
    },
    ingredients: {
        deliveredDate: { // 배달 받을 날짜
            byDayOfWeek: { // 요일에 따라
                tue: true, thu: true,
            },
        }
    }
    
}