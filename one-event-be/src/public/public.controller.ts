import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  
  @Get('health')
  @ApiOperation({ summary: 'Public health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  getHealth() {
    return { 
      status: 'ok', 
      message: 'Public controller is working',
      timestamp: new Date().toISOString()
    };
  }

  @Post('test-registration')
  @ApiOperation({ summary: 'Test registration endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  testRegistration(@Body() body: any) {
    return { 
      status: 'received', 
      data: body,
      message: 'Test registration endpoint is working'
    };
  }
}
