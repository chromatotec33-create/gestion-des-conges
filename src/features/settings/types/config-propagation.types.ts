export type ApplyMode = "current_only" | "all" | "selected";

export type ConfigPropagationPayload = {
  readonly sourceCompanyId: string;
  readonly configKey: string;
  readonly newValue: Record<string, unknown>;
  readonly applyMode: ApplyMode;
  readonly targetCompanyIds: string[];
};

export type CompanyOption = {
  readonly id: string;
  readonly name: string;
};
