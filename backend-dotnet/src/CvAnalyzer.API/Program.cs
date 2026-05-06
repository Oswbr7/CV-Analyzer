using CvAnalyzer.Infrastructure;
using System.Text.Json;
using CvAnalyzer.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddScoped<PdfService>();
builder.Services.AddHttpClient<AiService>(client =>
{
    client.BaseAddress = new Uri("http://127.0.0.1:8000/");
});

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapPost("/cv/upload/raw", async (
    HttpRequest request,
    PdfService pdfService) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest("Expected multipart/form-data");

    var form = await request.ReadFormAsync();

    var file = form.Files["file"];

    if (file == null)
        return Results.BadRequest("No file uploaded.");

    if (file.Length == 0)
        return Results.BadRequest("File is empty.");

    if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest("Only PDF files are allowed.");

    string extractedText;

    using (var stream = file.OpenReadStream())
    {
        extractedText = pdfService.ExtractText(stream);
    }

    if (string.IsNullOrWhiteSpace(extractedText))
        return Results.BadRequest("Could not extract text from PDF.");

    return Results.Ok(new
    {
        fileName = file.FileName,
        textLength = extractedText.Length,
        extractedText
    });
});

app.MapPost("/cv/upload/analyze", async (
    HttpRequest request,
    PdfService pdfService,
    AiService aiService) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest("Expected multipart/form-data");

    var form = await request.ReadFormAsync();

    var file = form.Files["file"];

    if (file == null)
        return Results.BadRequest("No file uploaded.");

    if (file.Length == 0)
        return Results.BadRequest("File is empty.");

    if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest("Only PDF files are allowed.");

    string extractedText;

    using (var stream = file.OpenReadStream())
    {
        extractedText = pdfService.ExtractText(stream);
    }

    if (string.IsNullOrWhiteSpace(extractedText))
        return Results.BadRequest("Could not extract text from PDF.");

    var aiResult = await aiService.AnalyzeCv(extractedText);

    return Results.Ok(new
    {
        fileName = file.FileName,
        textLength = extractedText.Length,
        analysis = aiResult
    });
});

app.MapPost("/cv/rank-pdfs", async (
    HttpRequest request,
    PdfService pdfService,
    AiService aiService) =>
{
    var form = await request.ReadFormAsync();

    var jobText = form["jobText"].ToString();

    var files = form.Files;

    var candidates = new List<object>();

    foreach (var file in files)
    {
        using var stream = file.OpenReadStream();

        var text = pdfService.ExtractText(stream);

        candidates.Add(new
        {
            name = Path.GetFileNameWithoutExtension(file.FileName),
            cv_text = text
        });
    }

    var result = await aiService.RankCandidates(jobText, candidates);

    return Results.Ok(result);
});

app.Run();
