declare module "bpmn-moddle" {
  type ParseResult = {
    rootElement?: unknown;
    warnings?: unknown[];
    elementsById?: Record<string, unknown>;
  };

  export default class BpmnModdle {
    fromXML(xml: string): Promise<ParseResult>;
  }
}
