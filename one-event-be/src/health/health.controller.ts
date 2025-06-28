import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
        services: {
          type: 'object',
          properties: {
            api: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                message: { type: 'string', example: 'Backend API is healthy' },
              },
            },
            email: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                message: {
                  type: 'string',
                  example: 'Email service is healthy',
                },
              },
            },
          },
        },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: 'ok',
          message: 'Backend API is healthy',
        },
        email: {
          status: 'ok',
          message: 'Email service is available',
        },
      },
    };
  }
}
