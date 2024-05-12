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
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
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
    public class options
    {
        public int UserID { get; set; }
        public int PostID { get; set; }
    }

    [Route("/api/getComments")]
    [ApiController]    
    public class handlePassComments
    {
        [HttpPost]        
        public async Task<ActionResult<comment>> fetchComments([FromBody] options option )
        {
            try
            {
                List comments<comment> = await handleComments.getComments(new Options { UserID = option.UserID, PostID = option.PostID });
                return Ok(comments);
            }
            catch (System.Exception)
            {
                Console.WriteLine("Failed to get comments");
                return StatusCode(500, "Internal Server Error");
            }
        }        
    }
    public class handleComments
    {
        public async Task<List<comment>> getComments(int userID, int postID)
        {
            try
            {
                string commentStatement = "SELECT * FROM COMMENTS WHERE postID = @PostID AND UserID = @UserID";
                string connectionString = ConnectionString.GetConnectionString();
                
                List<comment> comments = new List<comment>();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(commentStatement, connection))
                    {
                        command.Parameters.AddWithValue("@PostID", postID);
                        command.Parameters.AddWithValue("@UserID", userID);

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
                Console.WriteLine("Failed to get comments");
                return ([]);
            }
        }
    }
    [Route("/api/getPosts")]
    [ApiController]

    public class handlePosts : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<Post>> GetPosts([FromBody] options option)
        {
            try
            {
                string connectionString = ConnectionString.GetConnectionString();
                string postStatement = "";
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
                            item.comments = await handleComments.getComments(new Options { UserID = option.UserID, PostID = option.PostID });
                            Posts.Add(item);
                        }
                        reader.Close();
                    }
                }
                return Ok(Posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    [Route("/api/createPost")]
    [ApiController]
    public class handleCreatePost
    {         
        private string GetFileExtension(string fileName)
        {
            return Path.GetExtension(fileName).TrimStart('.');
        }
        [HttpPost]
        static async Task<ActionResult> createPost([FromBody] Post post)
        {
            try
            {
                string extension = Path.GetExtension(post.pictureFile.FileName);
                string imageFileName = $"{Guid.NewGuid()}.{GetFileExtension(post.pictureFile.FileName)}";
                string imagePath = Path.Combine("images", imageFileName);
                string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "images", imageFileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await post.picture.CopyToAsync(stream);
                }
                string queryStatement = "INSERT INTO POSTS (title, message, picture, likeCount, disLikeCount, userName, userID, postID) VALUES (@title, @message, @picture, 0, 0, @userName, @userID, @postID)";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        command.Parameters.AddWithValue("@comments", post.comments);
                        command.Parameters.AddWithValue("@dislikeCount", post.dislikeCount);
                        command.Parameters.AddWithValue("@likeCount", post.likeCount);
                        command.Parameters.AddWithValue("@message", post.message);
                        command.Parameters.AddWithValue("@picture", fullPath);
                        command.Parameters.AddWithValue("@postID", post.postID);
                        command.Parameters.AddWithValue("@title", post.title);
                        command.Parameters.AddWithValue("@userID", post.userID);
                        command.Parameters.AddWithValue("@userName", post.userName);
                        int rowsAffected = await command.ExecuteNonQueryAsync();

                        if (rowsAffected > 0){
                            return Ok("Post made");
                        } else {
                            return StatusCode(500, "Failed to create post");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
}