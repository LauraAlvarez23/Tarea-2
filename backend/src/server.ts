import express, { Application } from 'express';
import routes from './routes';

export class Server{
    private app: Application;
    private port: string | number;

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.middlewares();
        this.routes();
    }

    private middlewares(){
        this.app.use(express.json());
    }

    private routes(){
        this.app.use('/api/v1', routes);
    }

    public listen(){
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}