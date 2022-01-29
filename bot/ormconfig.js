module.exports = {
    type: 'mssql',
    host: '',
    port: 1433,
    username: '',
    password: '',
    database: '',
    entities: ['build/entities/*.js'],
    migrations: ['build/migrations/*.js'],
};
