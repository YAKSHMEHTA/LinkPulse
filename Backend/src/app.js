import express from 'express';

const app = express();


app.get('/health',(req,res)=>{
    res.json({msg:"Server healthy"});
})

app.listen(8080,()=>{
    console.log('server listening');
})