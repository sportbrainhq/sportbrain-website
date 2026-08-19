import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  entityListQuerySchema,
  type CompetitionDetail,
  type CompetitionSummary,
  type EntityListQuery,
  type Paginated,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { CompetitionsService } from './competitions.service';

@ApiTags('competitions')
@Controller('sports/:sportSlug/competitions')
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  @Get()
  @ApiOperation({ summary: 'List competitions in a sport' })
  @ApiOkResponse({ description: 'A paginated list, most important first' })
  async list(
    @Param('sportSlug') sportSlug: string,
    @Query(zodPipe(entityListQuerySchema)) query: EntityListQuery,
  ): Promise<Paginated<CompetitionSummary>> {
    return this.service.list(sportSlug, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Fetch one competition with its seasons and records' })
  @ApiNotFoundResponse({ description: 'No such competition in this sport' })
  async bySlug(
    @Param('sportSlug') sportSlug: string,
    @Param('slug') slug: string,
  ): Promise<CompetitionDetail> {
    return this.service.findBySlug(sportSlug, slug);
  }
}
