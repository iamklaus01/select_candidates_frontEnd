let style_element = `
<style>
.watermark{
        width: 100%;
        position: fixed;
        left: 50%;
        top: 50%;
        font-weight: bold;
        font-style: italic;
        font-size: 100pt;
        text-align: center;
        color: #212529;
        opacity: 0.1;
        z-index: 9999;
        transform: translate(-50%, -50%) rotate(-45deg);
    }
    .sample-results{
        margin-top : 2rem;
    }
    .table {
        margin: 0 0 40px 0;
        width: 100%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        display: table;
    }
    .table-row {
        display: table-row !important;
        background: #f6f6f6;
    }
    .table-row:nth-of-type(odd) {
        background: #e9e9e9;
    }
    .table-row.header {
        font-weight: 900;
        color: #ffffff;
        background: lightseagreen;
    }
    .cell {
        padding: 6px 12px;
        display: table-cell;
    }
    .table-title{
        color: #212529;
        font-family: "Poppins" , cursive;
        font-size: 16px;
        font-weight: 500;
      padding: .5rem;
    }
    .underline-title{
        margin: 2rem 0 1rem;
    }
    .underline-title p{
        font-family: "Playball" , cursive;
        font-size: 30px;
        color: #23468c;
        padding: 0 0 .5em 0;
        text-align: center;
        letter-spacing: 0.3px;
    }
    .underline-title hr{
        height: 2px;
        background: #ff5f2f;
        width: 80px;
        border: none;
        margin: auto;
    }
    @media screen and (max-width: 580px) {
        .cell {
            padding: 2px 16px;
            display: block;
        }
    }
    @media screen and (max-width: 580px) {
        .table-row {
            padding: 14px 0 7px;
            display: block;
        }
        .table-row.header {
            padding: 0;
            height: 6px;
        }
        .table-row.header .cell {
            display: none;
        }
        .table-row .cell {
            margin-bottom: 10px;
        }
        .table-row .cell:before {
            margin-bottom: 3px;
            content: attr(data-title);
            min-width: 98px;
            font-size: 10px;
            line-height: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: #969696;
            display: block;
        }
    }
    @media screen and (max-width: 580px) {
        .table {
            display: block;
        }
    }
    @media print{
        *{
            print-color-adjust: exact; 
        }
    }
</style>`;

let main_title = `
<div class="underline-title">
    <p>Selection of candidates with C-elect</p>
    <hr/>
</div>`;

let watermark = ` <div class="watermark">&copy;C-Elect</div>`

export function get_base_64__of_solutions(content) {
    return btoa(encodeURIComponent(content));
}
export function get_content_from_b64_solutions(b64_content) {
    return decodeURIComponent(atob(b64_content));
}

export function download_solution_as_pdf(content) {
    let solution_window = window.open();

    solution_window.document.write('<html>');
    solution_window.document.write(style_element);
    solution_window.document.write('<body>'+watermark+'<div class="main-result">');
    solution_window.document.write(main_title);
    solution_window.document.write('<div class="sample-results">');
    for (const table of content) {
        solution_window.document.write(table);
    }
    solution_window.document.write('</div></div></body></html>');
    solution_window.document.close();

    solution_window.print();
}