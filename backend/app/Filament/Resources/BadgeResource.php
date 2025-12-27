<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BadgeResource\Pages;
use App\Models\Badge;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Tables;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Tables\Columns\TextColumn;
use Filament\Actions\EditAction; // Corrected import
use Filament\Actions\DeleteBulkAction; // Corrected import
use Filament\Actions\BulkActionGroup; // Corrected import

class BadgeResource extends Resource
{
    protected static ?string $model = Badge::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-m-qr-code';
    
    protected static \UnitEnum|string|null $navigationGroup = 'Administration';

    protected static ?string $navigationLabel = 'Badges / RFID';

    protected static ?string $modelLabel = 'Badge';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informations Badge')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('code')
                                    ->label('Code RFID / QR')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255),
                                
                                Forms\Components\Select::make('user_id')
                                    ->label('Attribué au Client')
                                    ->relationship('user', 'name', fn ($query) => $query->where('role', 'client'))
                                    ->searchable()
                                    ->preload()
                                    ->placeholder('Sélectionner un client...')
                                    ->helperText('Laisser vide pour un badge en stock (non attribué).'),
                                
                                Forms\Components\Select::make('status')
                                    ->label('Statut')
                                    ->options([
                                        'active' => 'Actif',
                                        'inactive' => 'Inactif',
                                        'lost' => 'Perdu / Volé'
                                    ])
                                    ->default('active')
                                    ->required(),

                                Forms\Components\DatePicker::make('issued_at')
                                    ->label('Date d\'émission')
                                    ->default(now()),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')
                    ->label('Code Badge')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->fontFamily('mono'),
                
                TextColumn::make('user.name')
                    ->label('Détenteur')
                    ->searchable()
                    ->sortable()
                    ->placeholder('En Stock')
                    ->badge()
                    ->color(fn ($state) => $state ? 'info' : 'gray'),
                
                TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'gray',
                        'lost' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'active' => 'Actif',
                        'inactive' => 'Inactif',
                        'lost' => 'Perdu',
                        default => $state
                    }),

                TextColumn::make('issued_at')
                    ->label('Émis le')
                    ->date('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Actif',
                        'inactive' => 'Inactif',
                        'lost' => 'Perdu',
                    ]),
                Tables\Filters\TernaryFilter::make('assigned')
                    ->label('Attribution')
                    ->placeholder('Tous les badges')
                    ->trueLabel('Attribués')
                    ->falseLabel('En Stock')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('user_id'),
                        false: fn ($query) => $query->whereNull('user_id'),
                    ),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBadges::route('/'),
            'create' => Pages\CreateBadge::route('/create'),
            'edit' => Pages\EditBadge::route('/{record}/edit'),
        ];
    }
}
