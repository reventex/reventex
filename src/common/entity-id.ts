const MACHINE_ID = Math.floor(Math.random() * 0xffffff);
let index = Math.floor(Math.random() * 0xffffff);
const pid =
  (typeof process === 'undefined' || typeof process.pid !== 'number'
    ? Math.floor(Math.random() * 100000)
    : process.pid) % 0xffff;

function next(): number {
  return (index = (index + 1) % 0xffffff);
}

function hex(length: number, n: number): string {
  const h = n.toString(16);
  return h.length === length ? h : '00000000'.substring(h.length, length) + h;
}

function createDocumentId(): string {
  const time = Math.floor(Date.now() / 1000) % 0xffffffff;
  return hex(8, time) + hex(6, MACHINE_ID) + hex(4, pid) + hex(6, next());
}

const validateRegExp = /^[0-9A-F]{24}$/i;

export class EntityId {
  entityName: string;
  documentId: string;

  constructor(entityName: string, documentId: string) {
    if (entityName == null || entityName.constructor !== String) {
      throw new Error('Argument "entityName" must be a string');
    }

    if (documentId == null || documentId.constructor !== String) {
      throw new Error('Argument "documentId" must be a string"');
    }
    if (!validateRegExp.test(documentId)) {
      throw new Error(
        `Incorrect argument "documentId" = ${JSON.stringify(
          documentId
        )}. RegExp = ${validateRegExp}`
      );
    }

    this.entityName = entityName;
    this.documentId = documentId;
  }
}

export class EntityIdWithDocumentVersion {
  entityName: string;
  documentId: string;
  documentVersion: number;

  constructor(entityId: EntityId, documentVersion: number) {
    this.entityName = entityId.entityName;
    this.documentId = entityId.documentId;
    this.documentVersion = documentVersion;
  }

  toEntityId() {
    return new EntityId(this.entityName, this.documentId);
  }

  static fromEntityId(
    entityId?: EntityId,
    documentVersion?: number
  ): EntityIdWithDocumentVersion | null {
    if (entityId != null && documentVersion != null) {
      return new EntityIdWithDocumentVersion(entityId, documentVersion);
    } else {
      return null;
    }
  }
}

export const entityId = (entityName: string, documentId: string = createDocumentId()) =>
  new EntityId(entityName, documentId);
