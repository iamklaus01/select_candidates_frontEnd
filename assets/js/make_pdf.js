// import pdfMake from "../vendor/pdfmake/build/pdfmake";
// import pdfFonts from "../vendor/pdfmake/build/vfs_fonts";

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function get_base_64__of_solutions(content) {
    const pdfDocGenerator = pdfMake.createPdf(content);
    pdfDocGenerator.getBase64((data) => {
	    return data;
    });
}

export function download_solution_as_pdf(content) {
    pdfMake.createPdf(content).download();
}