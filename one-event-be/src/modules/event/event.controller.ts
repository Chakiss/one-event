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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';
import { UpdateEventLandingPageDto } from './dto/landing-page.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Tech Conference 2024' },
        description: { type: 'string', example: 'An amazing tech conference' },
        startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
        endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
        location: { type: 'string', example: 'Bangkok, Thailand' },
        maxAttendees: { type: 'number', example: 100 },
        status: { type: 'string', example: 'draft' },
        createdAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() user: User) {
    return this.eventService.create(createEventDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with optional filters' })
  @ApiQuery({ name: 'title', required: false, type: 'string' })
  @ApiQuery({ name: 'location', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'List of events',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          title: { type: 'string', example: 'Tech Conference 2024' },
          description: { type: 'string', example: 'An amazing tech conference' },
          startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
          endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
          location: { type: 'string', example: 'Bangkok, Thailand' },
          maxAttendees: { type: 'number', example: 100 },
          status: { type: 'string', example: 'published' },
        },
      },
    },
  })
  findAll(@Query() filterDto: EventFilterDto) {
    return this.eventService.findAll(filterDto);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published events' })
  @ApiResponse({
    status: 200,
    description: 'List of published events',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          title: { type: 'string', example: 'Tech Conference 2024' },
          description: { type: 'string', example: 'An amazing tech conference' },
          startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
          endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
          location: { type: 'string', example: 'Bangkok, Thailand' },
          maxAttendees: { type: 'number', example: 100 },
          status: { type: 'string', example: 'published' },
        },
      },
    },
  })
  findPublished() {
    return this.eventService.findPublished();
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user events' })
  @ApiResponse({
    status: 200,
    description: 'List of user events',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          title: { type: 'string', example: 'Tech Conference 2024' },
          description: { type: 'string', example: 'An amazing tech conference' },
          startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
          endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
          location: { type: 'string', example: 'Bangkok, Thailand' },
          maxAttendees: { type: 'number', example: 100 },
          status: { type: 'string', example: 'published' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyEvents(@CurrentUser() user: User) {
    return this.eventService.findMyEvents(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Tech Conference 2024' },
        description: { type: 'string', example: 'An amazing tech conference' },
        startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
        endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
        location: { type: 'string', example: 'Bangkok, Thailand' },
        maxAttendees: { type: 'number', example: 100 },
        status: { type: 'string', example: 'published' },
        createdAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event UUID' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Updated Tech Conference 2024' },
        description: { type: 'string', example: 'An updated amazing tech conference' },
        startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
        endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
        location: { type: 'string', example: 'Bangkok, Thailand' },
        maxAttendees: { type: 'number', example: 100 },
        status: { type: 'string', example: 'published' },
        updatedAt: { type: 'string', example: '2023-12-07T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    return this.eventService.update(id, updateEventDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event UUID' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.eventService.remove(id, user);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event published successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Tech Conference 2024' },
        status: { type: 'string', example: 'published' },
        message: { type: 'string', example: 'Event published successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  publishEvent(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.eventService.publishEvent(id, user);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event UUID' })
  @ApiResponse({
    status: 200,
    description: 'Event cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        title: { type: 'string', example: 'Tech Conference 2024' },
        status: { type: 'string', example: 'cancelled' },
        message: { type: 'string', example: 'Event cancelled successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  cancelEvent(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.eventService.cancelEvent(id, user);
  }

  // Admin-only endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all events (Admin only)' })
  @ApiQuery({ name: 'title', required: false, type: 'string' })
  @ApiQuery({ name: 'location', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'List of all events including drafts',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          title: { type: 'string', example: 'Tech Conference 2024' },
          description: { type: 'string', example: 'An amazing tech conference' },
          startDate: { type: 'string', example: '2024-06-01T10:00:00.000Z' },
          endDate: { type: 'string', example: '2024-06-01T18:00:00.000Z' },
          location: { type: 'string', example: 'Bangkok, Thailand' },
          maxAttendees: { type: 'number', example: 100 },
          status: { type: 'string', example: 'draft' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAllAdmin(@Query() filterDto: EventFilterDto) {
    return this.eventService.findAll(filterDto);
  }

  // Landing Page Endpoints
  @Patch(':id/landing-page')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event landing page configuration' })
  @ApiParam({ name: 'id', description: 'Event ID', type: 'string' })
  @ApiBody({ type: UpdateEventLandingPageDto })
  @ApiResponse({
    status: 200,
    description: 'Landing page configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only event organizer can edit' })
  updateLandingPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLandingPageDto: UpdateEventLandingPageDto,
    @CurrentUser() user: User,
  ) {
    return this.eventService.updateLandingPage(id, updateLandingPageDto, user.id);
  }

  @Get(':id/landing-page')
  @ApiOperation({ summary: 'Get event landing page configuration' })
  @ApiParam({ name: 'id', description: 'Event ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Landing page configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  getLandingPageConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.getLandingPageConfig(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get event by slug for public landing page' })
  @ApiParam({ name: 'slug', description: 'Event slug', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        location: { type: 'string' },
        price: { type: 'number' },
        maxAttendees: { type: 'number' },
        landingPageConfig: { type: 'object' },
        landingPageHtml: { type: 'string' },
        customCss: { type: 'string' },
        customJs: { type: 'string' },
        organizer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  getEventBySlug(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }

  @Post(':id/landing-page/preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Preview landing page with temporary configuration' })
  @ApiParam({ name: 'id', description: 'Event ID', type: 'string' })
  @ApiBody({ type: UpdateEventLandingPageDto })
  @ApiResponse({
    status: 200,
    description: 'Preview data generated successfully',
  })
  previewLandingPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() previewData: UpdateEventLandingPageDto,
    @CurrentUser() user: User,
  ) {
    return this.eventService.previewLandingPage(id, previewData, user.id);
  }
}
