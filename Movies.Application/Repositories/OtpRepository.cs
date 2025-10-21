using Dapper;
using Movies.Application.Database;
using Movies.Application.Models;
using System;
using System.Threading.Tasks;

namespace Movies.Application.Repositories
{
    public class OtpRepository
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public OtpRepository(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task AddOtpAsync(UserOtp otp)
        {
            const string sql = """
                                   insert into user_otps (id, "userid", code)
                                   values (@Id, @UserId, @Code);
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            await connection.ExecuteAsync(sql, otp);
        }

        public async Task<UserOtp?> GetOtpAsync(Guid userId, string code)
        {
            const string sql = """
                                   select * from user_otps
                                   where "userid" = @UserId and code = @Code
                                   limit 1;
                               """;

            using var connection = await _dbConnectionFactory.CreateConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<UserOtp>(sql, new { UserId = userId, Code = code });
        }
    }
}