using System;
using System.IO;
using System.Text;
using System.Data.Common;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using MySql.Data.MySqlClient;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;
using BCrypt;
using Server.Controllers;
using Server;
using checks;


namespace Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                DotNetEnv.Env.Load();
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                            .UseUrls(Environment.GetEnvironmentVariable("REACT_APP_SERVER_ADDRESS"));
                });        
    }
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCors(Options =>
            {
                Options.AddPolicy("AllowAll",
                    builder =>
                    {
                builder.WithOrigins(
                    "http://localhost:3000",
                    "http://192.168.0.254:3000")
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(env.ContentRootPath, "images")),
                RequestPath = "/images"
            });
            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }        
    }
    public class ConnectionString
    {
        public static string GetConnectionString()
        {
            string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
            string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
            string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
            string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");
            return $"server={hostStr};user={userStr};database={dataBaseStr};port=3306;password={passStr};";
        }
    }    
}
namespace Server.Controllers
{
    public class Post
    {
        public string title { get; set; }
        public string message { get; set; }
        public string picture { get; set; }
        public IFormFile pictureFile { get; set; }
        public int likeCount { get; set; }
        public int dislikeCount { get; set; }
        public List<comment> comments { get; set;}
        public string userName { get; set;}
        public int userID { get; set;}
        public int postID { get; set;}
    }
    public class comment
    {
        public string userPicture { get; set; }
        public string userName { get; set; }
        public string commentstring { get; set; }
        public int likeCount { get; set; }
        public int dislikeCount { get; set; }
    }
    public class Options
    {
        public int UserID { get; set; }
        public int PostID { get; set; }
    }

    // COMMENT HANDLE
    [Route("/api/getComments")]
    [ApiController]    
    public class handlePassComments : ControllerBase
    {
        [HttpPost]        
        public async Task<ActionResult<List<comment>>> fetchComments([FromBody] Options option)
        {
            try
            {   
                handleComments commentsHandler = new handleComments();
                List<comment> comments = await commentsHandler.getComments(option.UserID, option.PostID);
                return Ok(comments);
            }
            catch (System.Exception)
            {
                Console.WriteLine("Failed to get comments");
                return StatusCode(500, "Internal Server Error");
            }
        }        
    }
    // COLLECT COMMENTS FROM DATABASE
    public class handleComments
    {
        public async Task<List<comment>> getComments(int UserID, int PostID)
        {
            try
            {
                if (!checkChecks.CheckExist([UserID, PostID]))
                {
                    Console.WriteLine("Handle comments missing data")
                    return []
                }
                string commentStatement = "SELECT * FROM COMMENTS WHERE postID = @PostID AND UserID = @UserID";
                string connectionString = ConnectionString.GetConnectionString();
                
                List<comment> comments = new List<comment>();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(commentStatement, connection))
                    {
                        command.Parameters.AddWithValue("@PostID", PostID);
                        command.Parameters.AddWithValue("@UserID", UserID);

                        connection.Open();
                        MySqlDataReader reader = command.ExecuteReader();
                        
                        while (reader.Read())
                        {
                            comment comment = new comment
                            {
                                userPicture = reader.GetString(reader.GetOrdinal("userPicture")),
                                userName = reader.GetString(reader.GetOrdinal("userName")),
                                commentstring = reader.GetString(reader.GetOrdinal("comment")),
                                likeCount = reader.GetInt32(reader.GetOrdinal("likeCount")),
                                dislikeCount = reader.GetInt32(reader.GetOrdinal("dislikeCount"))
                            };
                            comments.Add(comment);
                        }
                        reader.Close();
                    }
                }
                return comments;                
            }
            catch (Exception ex)
            {   
                Console.WriteLine("Error", ex.Message);
                return [];
            }
        }
    }

    ////// POST HANDLE
    ///// Extra search terms Get posts postsCollect gett post postGet
    // GET POST
    [Route("/api/getPosts")]
    [ApiController]

    public class handlePosts : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<Post>> GetPosts([FromBody] Options option)
        {
            try
            {
                string connectionString = ConnectionString.GetConnectionString();
                string postStatement = "";
                if (!checks.checkChecks.checkExist([option.PostID, option.UserID]))
                {
                    Console.WriteLine("Failed to collect posts")
                    return StatusCode(500, 'Failed to collect posts please refresh')
                }
                if (option.UserID != -1 && option.PostID != -1)
                {
                    postStatement = "SELECT * FROM POSTS";
                }
                else if (option.UserID == -1 && option.PostID != -1) 
                {
                    postStatement = "SELECT * FROM POSTS WHERE PostID = @PostID";
                }
                else if (option.UserID != -1 && option.PostID == -1)
                {
                    postStatement = "SELECT * FROM POSTS WHERE UserID = @UserID";
                }


                List<Post> Posts = new List<Post>();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(postStatement, connection))
                    {
                        if (option.UserID != -1 && option.PostID == -1) 
                        {
                            command.Parameters.AddWithValue("@PostID", option.PostID);
                        }
                        else if (option.UserID == -1 && option.PostID != -1)
                        {
                            command.Parameters.AddWithValue("@UserID", option.UserID);
                        }
                        
                        
                        connection.Open();

                        MySqlDataReader reader = command.ExecuteReader();

                        handleComments commentsHandler = new handleComments(); 

                        while (reader.Read())
                        {
                            Post item = new Post
                            {
                                title = reader.GetString(reader.GetOrdinal("title")),
                                message = reader.GetString(reader.GetOrdinal("message")),
                                picture = reader.GetString(reader.GetOrdinal("picture")),
                                likeCount = reader.GetInt32(reader.GetOrdinal("likeCount")),
                                dislikeCount = reader.GetInt32(reader.GetOrdinal("dislikeCount")),
                                userName = reader.GetString(reader.GetOrdinal("userName")),
                                userID = reader.GetInt32(reader.GetOrdinal("userID")),
                                postID = reader.GetInt32(reader.GetOrdinal("postID")),                             
                            };
                            item.comments = await commentsHandler.getComments(option.UserID, option.PostID);
                            Posts.Add(item);
                        }
                        reader.Close();
                    }
                }
                return Ok(Posts);
            }
            catch (Exception ex)
            {   
                Console.WriteLine("Error", ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // CREATE POST
    [Route("/api/createPost")]
    [ApiController]
    public class handleCreatePost : ControllerBase
    {                 
        public class CreateItemRequest
        {
            public string title { get; set; }
            public string message { get; set; }
            public IFormFile Picture { get; set; }
            public int userID { get; set; }
            public string userName { get; set; }
        }  
        private string GetFileExtension(string fileName)
        {
            return Path.GetExtension(fileName).TrimStart('.');
        }
        [HttpPost]
        public async Task<ActionResult> createPost([FromForm] CreateItemRequest createItemRequest)
        {
            try
            {
                string[] checkList = new string[]
                {
                    createItemRequest.title,
                    createItemRequest.message,
                    createItemRequest.picture,
                    createItemRequest.userID,
                    createItemRequest.userName,                    
                };
                if (!checkChecks.CheckExist(checkList) || !checkChecks.checkType()) 
                {
                    Console.WriteLine('Bad Create Request')
                    return StatusCode(409, 'Bad Request')
                }
                string extension = Path.GetExtension(createItemRequest.Picture.FileName);
                string imageFileName = $"{Guid.NewGuid()}.{GetFileExtension(createItemRequest.Picture.FileName)}";
                string imagePath = Path.Combine("images", imageFileName);
                string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "images", imageFileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await createItemRequest.Picture.CopyToAsync(stream);
                }
                string queryStatement = "INSERT INTO POSTS (title, message, picture, likeCount, dislikeCount, userName, userID, postID) VALUES (@title, @message, @picture, 0, 0, @userName, @userID, @postID)";
                string connectionString = ConnectionString.GetConnectionString();
                Console.WriteLine(queryStatement, connectionString);
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        Console.WriteLine("Connection Open with params", createItemRequest.message, fullPath, createItemRequest.title, createItemRequest.userID, createItemRequest.userName);

                        command.Parameters.AddWithValue("@message", createItemRequest.message);
                        command.Parameters.AddWithValue("@picture", fullPath);
                        command.Parameters.AddWithValue("@title", createItemRequest.title);
                        command.Parameters.AddWithValue("@userID", createItemRequest.userID);
                        command.Parameters.AddWithValue("@userName", createItemRequest.userName);

                        int rowsAffected = await command.ExecuteNonQueryAsync();

                        if (rowsAffected > 0){
                            return Ok("Post made");
                        } else {
                            return StatusCode(500, "Allied mastermind AM ergo therefore i AM!");
                        }
                    }
                }
            }
            catch (Exception ex)
            {   
                Console.WriteLine("Error", ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    public class RegisterDetails
    {
        public string userName { get; set; }
        public string passWord { get; set; }
        public string emailAddress { get; set; }
    }
    public class LoginDetails
    {
        public int userID { get; set; }
        public string userName { get; set; }
        public string passWord { get; set; }
        public string emailAddress { get; set; }
    }    
    [Route("/api/Register")]
    [ApiController]
    public class RegisterHandle
    {

        [HttpPost]
        public async Task<ActionResult<LoginDetails>> RegisterUser([FromBody] RegisterDetails registerDetails)
        {
            try
            {
                string connectionString = await ConnectionString.GetConnectionString();
                string queryStatement = "INSERT into USERS (userName, passWord, emailAddress) VALUES (@userName, @passWord, @emailAddress)";
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        string hashedPassword = await BcryptEncryption.Encrypt(registerDetails.passWord);
                        command.Parameters.AddWithValue("@userName", registerDetails.userName);
                        command.Parameters.AddWithValue("@passWord", hashedPassword);
                        command.Parameters.AddWithValue("@emailAddress", registerDetails.emailAddress);

                        int rowsAffected = await command.ExecuteNonQueryAsync();

                        if (rowsAffected === 1)
                        {
                            return Ok("Successfully made account");
                        }
                        else if (rowsAffected > 1) 
                        {
                            Console.Writeline("CRITICAL ERROR IN USER GENERATION CHECK IMMEDIATELY");
                            return StatusCode(500, "Internal Server Error");
                        }
                    }
                }
            }
            catch (Exception ex)
            {   
                Console.WriteLine("Error", ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    [Route("/api/Login")]
    [ApiController]
    public class HandleLogin : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<LoginDetails>> Login([FromBody] LoginDetails loginDetails)
        {
            try
            {
                string connectionString = ConnectionString.GetConnectionString();
                string queryStatement = '';

                int selected = -1
                if (loginDetails.userName == '' && loginDetails.emailAddress != ''){
                    queryStatement = "SELECT * FROM USERS WHERE userName = @userName AND passWord = @passWord";
                    selected = 0
                } else if (loginDetails.userName != '' && loginDetails.emailAddress == ''){
                    queryStatement = "SELECT * FROM USERS WHERE emailAddress = @emailAddress AND passWord = @passWord";
                    selected = 1;
                } else {
                    return BadRequest("Invalid input");
                }

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connectionString))
                    {
                        if (selected === 0){
                            command.Parameters.AddWithValue("@userName", loginDetails.userName);
                        } else {
                            command.Parameters.AddWithValue("@emailAddress", loginDetails.emailAddress);
                        }

                        command.AddWithValue("passWord", loginDetails.passWord);

                        using (MySqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                int userID = reader.GetInt32(reader.GetOrdinal("userID"));
                                string username = reader.GetString(reader.GetOrdinal("userName"));
                                string hashedPassword = reader.GetString(reader.GetOrdinal("passWord"))
                                string email = reader.GetString(reader.GetOrdinal("emailAddress"));
                                if (BcryptEncryption.Decrypt(password, hashedPassword)){
                                    return Ok(new LoginDetails { userID = userID, userName = username, emailAddress = email });
                                }
                                return Unauthorized("Invalid username/email or password");
                            }
                            else
                            {
                                return Unauthorized("Invalid username/email or password");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {   
                Console.WriteLine("Error", ex.Message);
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}
namespace checks
{
    ////// CUSTOM CHECK CREATION
    // JWT CHECKS CREATION AND VALIDATION
    public class validationChecks
    {
        private static readonly string Secret = Environment.GetEnvironmentVariable("REACT_APP_TOKEN_SECRET");
        private class UserModel
        {
            public int userID { get; set}
            public string UserName { get; set; }
            public string EmailAddress { get; set; }
        }
        public static string CreateToken(UserModel userInfo)
        {
            Console.WriteLine(Secret);
            var TokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userInfo.userID.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, userInfo.userName)
                    new Claim(ClaimTypes.Email, userInfo.EmailAddress)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = TokenHandler.CreateToken(tokenDescriptor);
            var tokenString = TokenHandler.WriteToken(token);

            return tokenString;
        }

        public static boolean validateToken(token)
        {
            Console.WriteLine(Secret);
            var TokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Secret);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false, // Modify as needed
                ValidateAudience = false, // Modify as needed
                ValidateLifetime = true, // Ensure token hasn't expired
                ClockSkew = TimeSpan.Zero // Set clock skew to zero so that tokens are only valid exactly at their expiration time
            };

            SecurityToken validatedToken;
            var principal = TokenHandler.ValidateToken(token, tokenValidationParameters, out validatedToken);

            // Token is valid
            return true;
        }
        private class TokenRefreshRequestModel
        {
            public int UserID { get; set; }
            public string UserName { get; set; }
        }     
        public static TokenRefresh(TokenRefreshRequestModel requestModel)
        {
            if (string.IsNullOrWhiteSpace(requestModel.UserName))
            {
                return BadRequest("UserName cannot be empty or whitespace.");
            }

            var authorizationHeader = HttpContext.Request.Headers["Authorization"];
            if (string.IsNullOrEmpty(authorizationHeader))
            {
                Console.WriteLine("Failed to verify");
                return StatusCode(401, "Unauthorized");
            }
            var token = authorizationHeader.ToString().Replace("Bearer ", "");

            DateTime expirationTime = ValidateAndExtractExpirationTime(token);

            TimeSpan timeUntilExpiration = expirationTime - DateTime.UtcNow;

            if(timeUntilExpiration <= TimeSpan.FromMinutes(5))
            {
                string newToken = TokenHandler.CreateToken(requestModel.UserID, requestModel.UserName);
                return newToken;
            }                
            else {
                return token;
            }
        }   
        private DateTime ValidateAndExtractExpirationTime(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;
            var expirationTime = securityToken.ValidTo.ToUniversalTime();
            return expirationTime;
        }       
    }
    // ENCRYPTION AND DECRYPTION HANDLE
    public class BcryptEncryption
    {
        // ENCRYPT PASSWORD
        public static string Encrypt(string password)
        {
            if (!checkChecks.checkType(password, typeof(string))) return;
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, 10);
            return hashedPassword;
        }

        // DECRYPT PASSWORD
        public static bool Decrypt(string password, string hashedPassword)
        {
            if (!checkChecks.checkType(new string[] {password, hashedPassword}, typeof(string))) return;
            bool passwordMatches = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            return passwordMatches;
        }
    }
    // COMMON CHECK TYPES
    public class checkChecks
    {
        public static boolean checkType<T>(T[] incoming, Type targetType)
        {
            foreach (var item in incoming)
            {
                if (typeof(item) != targetType)
                {
                    return false;
                }
            }
            return true;
        }
        public static boolean checkCompare<T>(T[] incoming, T target)
        {
            foreach (var item in incoming)
            {
                if (!item.Equals(target)))
                {
                    return false;
                }
            }
            return true;
        }
        public static bool CheckExist<T>(T[] incoming)
        {
            foreach (var item in incoming)
            {
                if (Equals(item, default(T)))
                {
                    return false;
                }
            }
            return true;
        }
    }
}