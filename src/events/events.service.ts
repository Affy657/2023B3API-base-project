import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const allEvents = await this.eventRepository.find({
      where: {
        userId: userId,
      },
    });
    const date = dayjs(createEventDto.date);
    if (
      allEvents.some((event) => {
        return (
          date.isSame(event.date, 'year') &&
          date.isSame(event.date, 'month') &&
          date.isSame(event.date, 'day')
        );
      })
    ) {
      throw new UnauthorizedException('You have already an event on this day');
    }
    if (createEventDto.eventType === 'RemoteWork') {
      const remoteWorkEvents = allEvents.filter((event) => {
        return event.eventType === 'RemoteWork';
      });
      const remoteWorkEventsForWeek = remoteWorkEvents.filter((event) => {
        return dayjs(event.date).week() === date.week();
      });

      if (remoteWorkEventsForWeek.length >= 2) {
        throw new UnauthorizedException(
          'You can not have more than 2 remote work events per week',
        );
      }
    }

    const event = this.eventRepository.create(createEventDto);
    if (event.eventType === 'RemoteWork') {
      event.eventStatus = 'Accepted';
    }
    event.userId = userId;
    return await this.eventRepository.save(event);
  }

  async findAll() {
    return await this.eventRepository.find({});
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOne({
      where: {
        id: id,
      },
    });
    return event;
  }

  async validateEvent() {
    // Il est impossible d'altérer le statut d'un projet déjà validé ou refusé
    // Les administrateurs peuvent valider n'importe quelle demande
    // Il n'est possible de traiter un évènement que si l'utilisateur est rattaché à un projet le jour de l'évènement
    // Les chefs de projet peuvent valider ou refuser un évènement que si l'utilisateur
    // est rattaché à un projet où le chef est référent pour la date de l'évènement.
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
