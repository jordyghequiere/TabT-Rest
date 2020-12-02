import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClubEntry, MemberEntry, TeamEntry } from '../../../entity/tabt-soap/TabTAPI_Port';
import { ClubService } from '../../../services/clubs/club.service';
import { ClubMemberService } from '../../../services/clubs/club-member.service';
import { ClubTeamService } from '../../../services/clubs/club-team.service';
import { TabtException } from '../../../common/filter/tabt-exceptions.filter';
import { TabtHeadersDecorator } from '../../../common/decorators/tabt-headers.decorator';
import { GetMembersFromClub, ListAllClubs } from '../dto/club.dto';
import { RequestBySeasonDto } from '../../../common/dto/request-by-season.dto';
import { ClubCategory, PlayerCategory } from '../../../entity/tabt-input.interface';

@ApiTags('Clubs')
@Controller('clubs')
@TabtHeadersDecorator()
export class ClubController {
  constructor(
    private clubService: ClubService,
    private clubTeamService: ClubTeamService,
    private clubMemberService: ClubMemberService,
  ) {
  }

  @Get()
  @ApiOperation({
    operationId: 'findAllClubs'
  })
  @ApiResponse({
    description: 'A list of clubs.',
    type: [ClubEntry],

    status: 200,
  })
  @ApiResponse({
    status: 400,
    type: TabtException,
  })
  findAll(
    @Query() input: ListAllClubs,
  ) {
    return this.clubService.getClubs({ ClubCategory: ClubCategory[input.clubCategory], Season: input.season });
  }

  @Get(':clubIndex')
  @ApiOperation({
    operationId: 'findById'
  })
  @ApiResponse({
    description: 'A specific club based on the uniqueIndex.',
    type: ClubEntry,
    status: 200,
  })
  @ApiNotFoundResponse()
  @ApiResponse({
    status: 400,
    type: TabtException,
  })
  async findbyId(
    @Param('clubIndex') uniqueIndex: string,
    @Query() input: RequestBySeasonDto,
  ) {
    const value = await this.clubService.getClubById({ Season: input.season }, uniqueIndex);
    if (!value) {
      throw new NotFoundException();
    }
    return value;
  }

  @Get(':clubIndex/members')
  @ApiOperation({
    operationId: 'findClubMembers'
  })
  @ApiResponse({
    description: 'A list of members from a specific club.',
    type: [MemberEntry],
    status: 200,
  })
  @ApiResponse({
    status: 400,
    type: TabtException,
  })
  getClubMembers(
    @Query() input: GetMembersFromClub,
    @Param('clubIndex') uniqueIndex: string,
  ) {
    return this.clubMemberService.getClubsMembers({
      Club: uniqueIndex,
      Season: input.season,
      PlayerCategory: PlayerCategory[input.playerCategory] as unknown as number,
      UniqueIndex: input.uniqueIndex,
      NameSearch: input.nameSearch,
      ExtendedInformation: input.extendedInformation,
      RankingPointsInformation: input.rankingPointsInformation,
      WithResults: input.withResults,
      WithOpponentRankingEvaluation: input.withOpponentRankingEvaluation,
    });
  }

  @Get(':clubIndex/teams')
  @ApiOperation({
    operationId: 'findClubTeams'
  })
  @ApiResponse({
    description: 'A list of teams from a specific club.',
    type: [TeamEntry],
    status: 200,
  })
  @ApiResponse({
    status: 400,
    type: TabtException,
  })
  getClubTeams(
    @Query() input: RequestBySeasonDto,
    @Param('clubIndex') uniqueIndex: string,
  ) {
    return this.clubTeamService.getClubsTeams({ Club: uniqueIndex, Season: input.season });
  }
}
