<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250520140811 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE quotation_operation (id INT AUTO_INCREMENT NOT NULL, quotation_id INT NOT NULL, operation_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_8815D549B4EA4E60 (quotation_id), INDEX IDX_8815D54944AC3583 (operation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation_operation ADD CONSTRAINT FK_8815D549B4EA4E60 FOREIGN KEY (quotation_id) REFERENCES quotation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation_operation ADD CONSTRAINT FK_8815D54944AC3583 FOREIGN KEY (operation_id) REFERENCES operation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD client_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation ADD CONSTRAINT FK_474A8DB919EB6921 FOREIGN KEY (client_id) REFERENCES client (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_474A8DB919EB6921 ON quotation (client_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation_operation DROP FOREIGN KEY FK_8815D549B4EA4E60
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation_operation DROP FOREIGN KEY FK_8815D54944AC3583
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quotation_operation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP FOREIGN KEY FK_474A8DB919EB6921
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_474A8DB919EB6921 ON quotation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quotation DROP client_id
        SQL);
    }
}
