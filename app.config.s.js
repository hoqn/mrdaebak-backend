/**
 * @type {import('@/config').Config}
 */

export default {
    serverPort: 8080,
    socketPort: 1080,
    db: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'mrdaebak_schedules',
    }
    
}