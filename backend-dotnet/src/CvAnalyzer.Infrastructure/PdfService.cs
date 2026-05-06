using System.Text;
using System.Text.RegularExpressions;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;

namespace CvAnalyzer.Infrastructure.Services;

public class PdfService
{
    public string ExtractText(Stream pdfStream)
    {
        if (pdfStream == null || pdfStream.Length == 0)
            throw new ArgumentException("PDF stream is empty.");

        var extractedText = new StringBuilder();

        using var reader = new PdfReader(pdfStream);
        using var pdfDocument = new PdfDocument(reader);

        int totalPages = pdfDocument.GetNumberOfPages();

        for (int pageNumber = 1; pageNumber <= totalPages; pageNumber++)
        {
            var page = pdfDocument.GetPage(pageNumber);

            string pageText = PdfTextExtractor.GetTextFromPage(page);

            if (!string.IsNullOrWhiteSpace(pageText))
            {
                extractedText.AppendLine(pageText);
            }
        }

        return CleanText(extractedText.ToString());
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // replace multiple whitespace characters with a single space
        text = Regex.Replace(text, @"\s+", " ");

        text = text.Trim();

        return text;
    }
}