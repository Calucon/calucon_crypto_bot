import { parse } from "path/posix";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import * as validator from "../cro/validator";

if (process.env.VALIDATOR == undefined) {
  throw new Error("VALIDATOR not defined!");
}
const VALIDATOR = process.env.VALIDATOR;

export class ValidatordetailsCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("validatordetails", this.run);
  }

  private async run(ctx: Context<Update>) {
    const messagePromise = ctx.replyWithMarkdown("_Loading details..._");
    const detailsPromise = validator.details(VALIDATOR);

    const priceCroCdcPromise = cdcApi.prices("CRO_USDC");
    const priceCroCdc = (await priceCroCdcPromise).result.data;
    const croPriceCdc = parseFloat(priceCroCdc.b).toFixed(5);

    const message = await messagePromise;
    const details = await detailsPromise;

    ctx.telegram.editMessageText(
      ctx.chat?.id,
      message.message_id,
      undefined,
      details.stderr.length > 0
        ? this.getErrorMessage()
        : getSuccessMessage(details.stdout, croPriceCdc),
      { parse_mode: "Markdown" }
    );
  }

  private getErrorMessage(): string {
    return "_An error occurred!_";
  }
}

/**
 * When putting this function into the class I get an error stating:
 * could not read getSuccessMessage of undefined.
 * No idead what causes this so this method is now placed here
 *
 * @param stdOut
 * @param croPrice
 * @returns
 */
function getSuccessMessage(stdOut: string, croPrice: string): string {
  const data = JSON.parse(stdOut);

  const delegated = (parseInt(data.tokens) / Math.pow(10, 14)).toFixed(2);
  const comms = (
    parseFloat(data.commission.commission_rates.rate) * 100
  ).toFixed(2);

  return [
    `*${data.description.moniker}*`,
    "",
    "```",
    `CRO Price:      $${croPrice}`,
    `CRO Staked:     ${delegated} M`,
    `Jailed:         ${data.jailed}`,
    `Comms Rate:     ${comms} %`,
    `APR:            ${"null"}`,
    `Avg Block Time: ${"null"}`,
    `Missed Blocks:  ${"null"}`,
    "```",
  ].join("\n");
}

export default function init(
  bot: Telegraf<Context<Update>>
): ValidatordetailsCommand {
  return new ValidatordetailsCommand(bot);
}
