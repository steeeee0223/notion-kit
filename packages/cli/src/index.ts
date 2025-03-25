#!/usr/bin/env node
import packageJson from "~/package.json";
import { Command } from "commander";

import { addCommand } from "@/commands/add";
import { initCommand } from "@/commands/init";

function main() {
  const program = new Command()
    .name("notion-ui")
    .description("CLI to setup dotUI.")
    .helpOption("-h, --help", "Display this help message.")
    .usage("[command] [options]")
    .version(
      packageJson.version,
      "-v, --version",
      "Output the current version of notion-ui.",
    );

  program.addCommand(initCommand).addCommand(addCommand);

  program.parse();
}

main();
