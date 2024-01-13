import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    return this.eventsService.create(createEventDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return await this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.eventsService.findOne(id);
  }

  //Il est impossible d'altérer le statut d'un projet déjà validé ou refusé
  // Les administrateurs peuvent valider n'importe quelle demande
  // Il n'est possible de traiter un évènement que si l'utilisateur est rattaché à un projet le jour de l'évènement
  // Les chefs de projet peuvent valider ou refuser un évènement que si l'utilisateur
  // est rattaché à un projet où le chef est référent pour la date de l'évènement.

  @Post(':id/validate')
  async validate(@Param('id') id: string, @Req() req) {
    if (req.user.role === 'employee') {
      throw new UnauthorizedException();
    }
  }

  @Post(':id/decline')
  async decline(@Param('id') id: string, @Req() req) {
    if (req.user.role === 'employee') {
      throw new UnauthorizedException();
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
