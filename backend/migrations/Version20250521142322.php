<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250521142322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD vehicle_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD CONSTRAINT FK_474A8DB9545317D1 FOREIGN KEY (vehicle_id) REFERENCES vehicle (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_474A8DB9545317D1 ON quotation (vehicle_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle CHANGE vin vin VARCHAR(255) DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP FOREIGN KEY FK_474A8DB9545317D1
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_474A8DB9545317D1 ON quotation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP vehicle_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE vehicle CHANGE vin vin VARCHAR(255) NOT NULL
        SQL);
    }
}
