import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("first_name");
    table.string("last_name");
    table.string("company_name");
    table.string("company_website");
    table.string("verification_token").nullable();
    table.string("reset_token").nullable();
    table.boolean("is_verified").defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
