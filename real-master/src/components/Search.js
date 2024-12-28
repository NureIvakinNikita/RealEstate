import { useState } from "react";

const Search = ({ homes, setFilteredHomes }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        // Фільтрування нерухомості за ключовими словами
        const filtered = homes.filter((home) => {
            const { attributes, address } = home;
            return (
                address.toLowerCase().includes(term) || // Пошук за адресою
                attributes.some((attribute) =>
                    attribute.value.toString().toLowerCase().includes(term)
                ) // Пошук за іншими атрибутами (ціна, розмір, кімнати)
            );
        });

        setFilteredHomes(filtered);
    };

    return (
        <header>
            <h2 className="header__title">Search it. Explore it. Buy it.</h2>
            <input
                type="text"
                className="header__search"
                placeholder="Enter an address, neighborhood, city, or ZIP code"
                value={searchTerm}
                onChange={handleSearch}
            />
        </header>
    );
};

export default Search;
