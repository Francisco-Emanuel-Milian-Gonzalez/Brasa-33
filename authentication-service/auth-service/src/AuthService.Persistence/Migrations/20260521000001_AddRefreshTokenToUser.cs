using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Agregar columnas de refresh token a la tabla users
            migrationBuilder.AddColumn<string>(
                name: "refresh_token",
                table: "users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "refresh_token_expiry",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            // Índice para acelerar la búsqueda por refresh token
            migrationBuilder.CreateIndex(
                name: "ix_users_refresh_token",
                table: "users",
                column: "refresh_token",
                unique: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_refresh_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "refresh_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "refresh_token_expiry",
                table: "users");
        }
    }
}
