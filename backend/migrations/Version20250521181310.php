<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250521181310 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E3C4FFF555
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E319EB6921
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_7A2119E3C4FFF555 ON bill
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_7A2119E319EB6921 ON bill
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD meeting_id INT NOT NULL, DROP client_id, DROP garage_id, DROP price
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD CONSTRAINT FK_7A2119E367433D9C FOREIGN KEY (meeting_id) REFERENCES meeting (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_7A2119E367433D9C ON bill (meeting_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E367433D9C
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_7A2119E367433D9C ON bill
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD garage_id INT NOT NULL, ADD price DOUBLE PRECISION NOT NULL, CHANGE meeting_id client_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD CONSTRAINT FK_7A2119E3C4FFF555 FOREIGN KEY (garage_id) REFERENCES garage (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bill ADD CONSTRAINT FK_7A2119E319EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_7A2119E3C4FFF555 ON bill (garage_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_7A2119E319EB6921 ON bill (client_id)
        SQL);
    }
}
