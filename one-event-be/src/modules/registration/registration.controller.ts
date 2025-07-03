import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Registrations')
@ApiBearerAuth('JWT-auth')
@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({
    summary:
      'Register for an event (supports both authenticated users and guests)',
  })
  @ApiBody({ type: CreateRegistrationDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for event',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        eventId: { type: 'string', example: 'uuid-string' },
        userId: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'confirmed' },
        registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Already registered or event full' })
  register(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @CurrentUser() user?: User,
  ) {
    return this.registrationService.register(createRegistrationDto, user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all registrations (Admin only)' })
  @ApiQuery({ name: 'eventId', required: false, type: 'string' })
  @ApiQuery({ name: 'userId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'List of all registrations',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          eventId: { type: 'string', example: 'uuid-string' },
          userId: { type: 'string', example: 'uuid-string' },
          status: { type: 'string', example: 'confirmed' },
          registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll(@Query() filterDto: RegistrationFilterDto) {
    return this.registrationService.findAll(filterDto);
  }

  @Get('my-registrations')
  @ApiOperation({ summary: 'Get current user registrations' })
  @ApiResponse({
    status: 200,
    description: 'List of user registrations',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          eventId: { type: 'string', example: 'uuid-string' },
          userId: { type: 'string', example: 'uuid-string' },
          status: { type: 'string', example: 'confirmed' },
          registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
          event: {
            type: 'object',
            properties: {
              title: { type: 'string', example: 'Tech Conference 2024' },
              startDate: {
                type: 'string',
                example: '2024-06-01T10:00:00.000Z',
              },
              location: { type: 'string', example: 'Bangkok, Thailand' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyRegistrations(@CurrentUser() user: User) {
    return this.registrationService.findMyRegistrations(user);
  }

  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get event registrations (Admin only)' })
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of event registrations',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          eventId: { type: 'string', example: 'uuid-string' },
          userId: { type: 'string', example: 'uuid-string' },
          status: { type: 'string', example: 'confirmed' },
          registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findEventRegistrations(@Param('eventId') eventId: string) {
    return this.registrationService.findEventRegistrations(eventId);
  }

  @Get('event/:eventId/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get event registration statistics (Admin only)' })
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event registration statistics',
    schema: {
      type: 'object',
      properties: {
        totalRegistrations: { type: 'number', example: 50 },
        confirmedRegistrations: { type: 'number', example: 45 },
        cancelledRegistrations: { type: 'number', example: 5 },
        attendedCount: { type: 'number', example: 40 },
        maxAttendees: { type: 'number', example: 100 },
        availableSpots: { type: 'number', example: 50 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  getEventStats(@Param('eventId') eventId: string) {
    return this.registrationService.getEventStats(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Registration found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        eventId: { type: 'string', example: 'uuid-string' },
        userId: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'confirmed' },
        registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
        event: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Tech Conference 2024' },
            startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
            location: { type: 'string', example: 'Bangkok, Thailand' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  findOne(@Param('id') id: string) {
    return this.registrationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update registration' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiBody({ type: UpdateRegistrationDto })
  @ApiResponse({
    status: 200,
    description: 'Registration updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        eventId: { type: 'string', example: 'uuid-string' },
        userId: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'confirmed' },
        updatedAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
    @CurrentUser() user: User,
  ) {
    return this.registrationService.update(id, updateRegistrationDto, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel registration' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Registration cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'cancelled' },
        message: {
          type: 'string',
          example: 'Registration cancelled successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.registrationService.cancel(id, user);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Confirm registration (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Registration confirmed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'confirmed' },
        message: {
          type: 'string',
          example: 'Registration confirmed successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.registrationService.confirm(id, user);
  }

  @Patch(':id/attended')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mark registration as attended (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiResponse({
    status: 200,
    description: 'Registration marked as attended successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        status: { type: 'string', example: 'attended' },
        message: {
          type: 'string',
          example: 'Registration marked as attended successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  markAttended(@Param('id') id: string, @CurrentUser() user: User) {
    return this.registrationService.markAttended(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete registration' })
  @ApiParam({ name: 'id', type: 'string', description: 'Registration UUID' })
  @ApiResponse({
    status: 204,
    description: 'Registration deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.registrationService.remove(id, user);
  }

  @Get('my-event/:eventId')
  @ApiOperation({ summary: 'Get registrations for my event (Event organizer)' })
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of registrations for your event',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          eventId: { type: 'string', example: 'uuid-string' },
          userId: { type: 'string', example: 'uuid-string' },
          status: { type: 'string', example: 'confirmed' },
          guestName: { type: 'string', example: 'John Doe' },
          guestEmail: { type: 'string', example: 'john@example.com' },
          registeredAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not event organizer' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findMyEventRegistrations(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.registrationService.findMyEventRegistrations(eventId, user);
  }

  @Get('my-event/:eventId/stats')
  @ApiOperation({
    summary: 'Get registration statistics for my event (Event organizer)',
  })
  @ApiParam({ name: 'eventId', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event registration statistics for your event',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 50 },
        pending: { type: 'number', example: 5 },
        confirmed: { type: 'number', example: 40 },
        cancelled: { type: 'number', example: 3 },
        attended: { type: 'number', example: 35 },
        noShow: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not event organizer' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  getMyEventStats(
    @Param('eventId') eventId: string,
    @CurrentUser() user: User,
  ) {
    return this.registrationService.getMyEventStats(eventId, user);
  }
}
