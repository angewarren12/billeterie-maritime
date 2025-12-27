<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'user_id',
        'status',
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

