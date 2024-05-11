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
using Startup;

namespace Startup
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
            RequestPath = "/StoreImages"
        });
        app.UseRouting();
        app.UseCors("AllowAll");
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
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
namespace Server.MapControllers
{
    public class Post
    {
        public string title { get; set; }
        public string message { get; set; }
        public string picture { get; set; }
        public int likeCount { get; set; }
        public int dislikeCount { get; set; }
        public List comments { get; set;}
        public string userName { get; set;}
        public int userID { get; set;}
        public int postID { get; set;}
    }
    public class comment
    {
        public string userPicture { get; set; }
        public string userName { get; set; }
        public string comment { get; set; }
        public int likeCount { get; set; }
        public int dislikeCount { get; set; }
    }
    [Route("/api/getPosts")]
    [ApiController]

    public class getPosts
    {
        private class options
        {
            public int UserID { get; set; }
            public int PostID { get; set; }
        }
        [HttpGet]
        public async Task<ActionResult<Post>> getPosts([fromBody] options option)
        {
            try
            {
                string ConnectionString = ConnectionString.GetConnectionString();
                string postStatement = ""
                if (option.UserID !== -1 && option.PostID !== -1)
                {
                    postStatement = "SELECT * FROM POSTS"
                }
                else if (option.UserID == -1 && option.PostID !== -1) 
                {
                    postStatement = "SELECT * FROM POSTS WHERE PostID = @PostID"
                }
                else if (option.UserID !== -1 && option.PostID == -1)
                {
                    postStatement = "SELECT * FROM POSTS WHERE UserID = @UserID"
                }


                List<Post> Posts = new List<Post>();

                using (MySqlConnection connection = new MySqlConnection(ConnectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(postStatement, connection))
                    {
                        if (option.UserID !== -1 && option.PostID == -1) 
                        {
                            command.Parameters.AddWithValue("@PostID", option.UserID);
                        }
                        else if (option.UserID == -1 && option.PostID !== -1)
                        {
                            command.Parameters.AddWithValue("@UserID", option.PostID);
                        }
                        
                        
                        connection.Open()

                        MySqlDataReader reader = command.ExecuteReader()

                        while (reader.read())
                        {
                            Post item = new Post
                            {
                                title = reader.GetString(reader.GetOrdinal("title")),
                                message = reader.postID(reader.GetOrdinal("message")),
                                picture = reader.postID(reader.GetOrdinal("picture")),
                                likeCount = reader.GetInt32(reader.GetOrdinal("likeCount")),
                                dislikeCount = reader.GetInt32(reader.GetOrdinal("dislikeCount")),
                                userName = reader.postID(reader.GetOrdinal("userName")),
                                userID = reader.GetInt32(reader.GetOrdinal("userID")),
                                postID = reader.GetInt32(reader.GetOrdinal("postID")),                             
                            };
                            item.comments = await getComments(option.UserID, option.PostID)
                            Posts.Add(item);
                        }
                        reader.Close();
                        return Ok(Posts);
                    }

                }
            }
            catch (System.Exception)
            {
                return Status(500, 'Internal server error')
            }
        }

        public async Task<List<comment>> getComments(int userID, int postID)
        {
            try
            {
                string commentStatement = "SELECT * FROM COMMENTS WHERE postID = @PostID AND UserID = @UserID"
                string ConnectionString = ConnectionString.GetConnectionString();
                
                List<comment> comments = new List<comment>();

                using (MySqlConnection connection = new MySqlConnection(ConnectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(commentStatement, connection))
                    {
                        command.Parameters.AddWithValue("@PostID", postID);
                        command.Parameters.AddWithValue("@UserID", userID);

                        connection.Open()
                        MySqlDataReader reader = command.ExecuteReader();
                        
                        while (reader.read)
                        {
                            comment comment = new comment
                            {
                                userPicture = reader.GetString(reader.GetOrdinal("userPicture"))
                                userName = reader.GetString(reader.GetOrdinal("userName"))
                                comment = reader.GetString(reader.GetOrdinal("comment"))
                                likeCount = reader.GetInt32(reader.GetOrdinal("likeCount"))
                                dislikeCount = reader.GetInt32(reader.GetOrdinal("dislikeCount"))
                            }
                            comments.Add(comment)
                        }
                        reader.Close();
                        return comments
                    }
                }
            }
            catch (System.Exception)
            {
                Console.WriteLine("Failed to get comments")
                return ([])
            }
        }
    }
}