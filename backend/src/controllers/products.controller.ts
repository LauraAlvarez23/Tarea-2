import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const getAllProducts = async (_req: Request, res: Response) =>{
    try{
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        res.status(500).json({ message: 'Internal server error'});
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = Number(id);

    if(isNaN(productId) || productId <= 0){
        return res.status(400).json({ message: 'Invalid ID'});
    }

    try{
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM products WHERE id = ? AND active = TRUE', 
            [productId]
        );
        if(rows.length === 0){
            return res.status(404).json({ message: 'Product not found'});
        }
        res.json(rows[0]);

    }catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        return res.status(500).json({ message: 'Internal server error'});
    }
};

export const createProduct = async (req: Request, res: Response) => {
    const { name, price, stock, description, brand, img } = req.body;

    if(!name || price === undefined || stock === undefined || !description){
        return res.status(400).json({message: 'Incomplete required fields'});
    }

    const numPrice = Number(price);
    if(isNaN(numPrice) || numPrice <= 0){
        return res.status(400).json({message: 'The price must be greater than zero'});
    }

    const numStock = Number(stock);
    if(isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)){
        return res.status(400).json({message: 'Invalid stock number'});
    }

    try{    
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO products (name, price, stock, description, brand, img, active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [name, numPrice, numStock, description, brand || null, img || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Product created'});
    }catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = Number(id);
    const { name, price, stock, description, brand, img} = req.body;

    if(!name || price === undefined || stock === undefined || !description){
        return res.status(400).json({message: 'Incomplete required fields'});
    }

    if(isNaN(productId) || productId <= 0){
        return res.status(400).json({message: 'Invalid ID'});
    }

    const numPrice = Number(price);
    if(isNaN(numPrice) || numPrice <= 0){
        return res.status(400).json({message: 'The price must be a positive number'});
    }

    const numStock = Number(stock);
    if(isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)){
        return res.status(400).json({message: 'Invalid stock number'});
    }

    try{
        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE products
             SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ?
             WHERE id = ? AND active = TRUE`,
             [name, numPrice, numStock, description, brand || null, img || null, productId]
        );

        if(result.affectedRows === 0){
            return res.status(404).json({message: 'Product not found'});
        }

        res.json({message: 'Product updated'});

    }catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        res.status(500).json({message: 'Internal server error'});
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = Number(id);

    if(isNaN(productId) || productId <= 0){
        return res.status(400).json({message: 'Invalid ID'});
    }

    try{
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
            [productId]
        );

        if(result.affectedRows === 0){
            return res.status(404).json({message: 'Product not found'});
        }

        res.json({message: 'Product deleted'});

    }catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        res.status(500).json({message: 'Internal server error'});
    }
};

export const changePrice = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = Number(id);   
    const { price } = req.body;     

    //Para que solo acepte el campo ID
    const bodyKeys = Object.keys(req.body);
    const hasInvalidKeys = bodyKeys.some(key => key !== 'price');

    if(bodyKeys.length === 0 || hasInvalidKeys){
        return res.status(400).json({message: 'Invalid request body. Only price is allowed'});
    }
    
    if(isNaN(productId) || productId <= 0){
        return res.status(400).json({message: 'Invalid ID'});
    }

    const numPrice = Number(price);
    if(isNaN(numPrice) || numPrice <= 0){
        return res.status(400).json({message: 'The price must be greater than zero'});
    }

    try{
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
            [numPrice, productId]
        );

        if(result.affectedRows === 0){
            return res.status(404).json({message: 'Product not found'});
        }

        res.json({ message: 'Price updated'});
    }catch(error){
        console.log("Internal SERVER ERROR: "+ error);
        res.status(500).json({message: 'Internal server error'});
    }
};

