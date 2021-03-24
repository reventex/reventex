type Narrowable =
  | string
  | number
  | boolean
  | symbol
  | object
  | undefined
  | void
  | null
  | {};

export type ValuesOfTyple<
  T extends ReadonlyArray<any>
> = T extends ReadonlyArray<any> ? T[number] : never;

class Domain<
  EventTypes extends ReadonlyArray<Narrowable> = [],
  Projections extends ReadonlyArray<{
    name: Narrowable;
    handlers: Partial<Record<ValuesOfTyple<EventTypes>, boolean>>
  }> = []
> {
  readonly eventTypes: EventTypes = [] as any;
  readonly projections: Projections = [] as any;
  constructor(
    eventTypes: EventTypes = [] as any,
    projections: Projections = [] as any
  ) {
    this.eventTypes = eventTypes;
    this.projections = projections;
  }
  eventType<EventType extends string>(
    eventType: EventType
  ): Domain<readonly [...EventTypes, EventType], readonly [...Projections]> {
    return new Domain<any, any>([...this.eventTypes, eventType], [...this.projections]);
  }
  projection<Name extends Narrowable>(projection: {
    name: Name;
    handlers: Partial<Record<ValuesOfTyple<EventTypes>, boolean>>;
  }): Domain<
    readonly [...EventTypes],
    readonly [
      ...Projections,
      { name: Name; handlers: Partial<Record<ValuesOfTyple<EventTypes>, boolean>> }
    ]
  > {
    return new Domain<any, any>([...this.eventTypes], [...this.projections, projection]);
  }
}

const domain = () => new Domain();

const app = domain()
  .eventType("qqq")
  .eventType("www")
  .eventType("eee")
  .eventType("rrr")
  .eventType("ttt")
  .projection({
    name: "sdsdf",
    handlers: {
      eee: true,
      qqq: true,
      ttt: true,
      www: false,
    },
  })
  .projection({
    name: "adasda",
    handlers: {
      eee: true,
      qqq: true,
      ttt: true,
      www: false,
    },
  })
