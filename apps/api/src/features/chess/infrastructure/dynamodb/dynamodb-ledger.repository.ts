import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { LedgerEventView } from '@chess-ledger/shared';

import { AppConfigService } from '../../../../infrastructure/config/app-config.service';
import type { LedgerEventDraft, LedgerRepository } from '../../application/ports/ledger-repository.port';

@Injectable()
export class DynamoDbLedgerRepository implements LedgerRepository, OnModuleInit {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(config: AppConfigService) {
    this.tableName = config.dynamoDbLedgerTable;
    const dynamoClient = new DynamoDBClient({
      endpoint: config.dynamoDbEndpoint,
      region: config.dynamoDbRegion
    });
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureTable();
  }

  async append(matchId: string, events: readonly LedgerEventDraft[]): Promise<readonly LedgerEventView[]> {
    const existingEvents = await this.list(matchId);
    let nextSequence = existingEvents.length + 1;
    const savedEvents: LedgerEventView[] = [];

    for (const event of events) {
      const ledgerEvent: LedgerEventView = {
        id: randomUUID(),
        matchId,
        sequence: nextSequence,
        ...event
      };

      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: ledgerEvent,
          ConditionExpression: 'attribute_not_exists(matchId) and attribute_not_exists(#sequence)',
          ExpressionAttributeNames: {
            '#sequence': 'sequence'
          }
        })
      );

      savedEvents.push(ledgerEvent);
      nextSequence += 1;
    }

    return savedEvents;
  }

  async list(matchId?: string): Promise<readonly LedgerEventView[]> {
    if (matchId) {
      const result = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'matchId = :matchId',
          ExpressionAttributeValues: {
            ':matchId': matchId
          },
          ScanIndexForward: true
        })
      );

      return (result.Items ?? []) as LedgerEventView[];
    }

    const result = await this.client.send(new ScanCommand({ TableName: this.tableName }));
    return ((result.Items ?? []) as LedgerEventView[]).sort((a, b) => {
      const timeOrder = a.occurredAt.localeCompare(b.occurredAt);
      return timeOrder === 0 ? a.sequence - b.sequence : timeOrder;
    });
  }

  private async ensureTable(): Promise<void> {
    try {
      await this.client.send(new DescribeTableCommand({ TableName: this.tableName }));
      return;
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    await this.client.send(
      new CreateTableCommand({
        TableName: this.tableName,
        AttributeDefinitions: [
          { AttributeName: 'matchId', AttributeType: 'S' },
          { AttributeName: 'sequence', AttributeType: 'N' }
        ],
        KeySchema: [
          { AttributeName: 'matchId', KeyType: 'HASH' },
          { AttributeName: 'sequence', KeyType: 'RANGE' }
        ],
        BillingMode: 'PAY_PER_REQUEST'
      })
    );
  }
}
