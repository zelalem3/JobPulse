<?Php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramMessage extends Model
{
    protected $fillable = [
        'chat_id',
        'user_id',
        'username',
        'direction',
        'content',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'chat_id' => 'integer',
        'user_id' => 'integer',
    ];
}   