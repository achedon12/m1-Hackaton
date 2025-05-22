<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250522090447 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD garage_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD CONSTRAINT FK_474A8DB9C4FFF555 FOREIGN KEY (garage_id) REFERENCES garage (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_474A8DB9C4FFF555 ON quotation (garage_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP FOREIGN KEY FK_474A8DB9C4FFF555
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_474A8DB9C4FFF555 ON quotation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP garage_id
        SQL);
    }
}
