import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class HomeController {
  @Get()
  getHome(@Res() res: Response) {
    res.send(`
      <html>
        <head>
          <title>Control de Acceso</title>
          <style>
            body { 
              font-family: Arial; 
              background: #f0f0f0; 
              text-align: center; 
              padding-top: 100px;
            }
            h1 { color: #2e6da4; }
            a {
              display: inline-block;
              margin-top: 20px;
              background: #2e6da4;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
            }
            a:hover {
              background: #204d74;
            }
          </style>
        </head>
        <body>
          <h1>🚪 Sistema de Control de Acceso</h1>
          <p>Servidor NestJS ejecutándose correctamente.</p>
          <a href="/api/status">Ver estado del Arduino</a>
        </body>
      </html>
    `);
  }
}
